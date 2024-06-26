using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using FinanceAPI.Data;
using FinanceAPI.Dtos;
using FinanceAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<FinanceApiContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<FinanceApiContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(builder => {
        builder.WithOrigins("https://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Finance API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        In = ParameterLocation.Header,
        Description = "Please insert JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        Array.Empty<string>()
    }
    });
});

var app = builder.Build();

app.UseCors();

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Finance API V1");
});

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");

app.MapPost("/register", async (UserManager<ApplicationUser> userManager, RegisterDto registerDto) => {
    var user = new ApplicationUser {
        UserName = registerDto.Username,
        Email = registerDto.Email,
        AccountNumber = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10) 
    };
    var result = await userManager.CreateAsync(user, registerDto.Password);

    if (result.Succeeded) {
        return Results.Ok(user);
    }

    return Results.BadRequest(result.Errors);
});

app.MapPost("/login", async (UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, UserLoginDto loginDto) => {
    var user = await userManager.FindByNameAsync(loginDto.Username);

    if (user == null) {
        return Results.Unauthorized();
    }

    var result = await signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

    if (!result.Succeeded) {
        return Results.Unauthorized();
    }

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim("uid", user.Id) 
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: builder.Configuration["Jwt:Issuer"],
        audience: builder.Configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(30),
        signingCredentials: creds);

    return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
});

app.MapGet("/profile", [Authorize] async (HttpContext httpContext, UserManager<ApplicationUser> userManager) => {
    var userId = httpContext.User.FindFirstValue("uid");  

    if (userId == null) {
        return Results.NotFound("User ID not found.");
    }

    var user = await userManager.FindByIdAsync(userId);

    if (user == null) {
        return Results.NotFound("User not found.");
    }

    var userProfile = new {
        user.UserName,
        user.Email,
        user.Balance,
        user.AccountNumber
    };

    return Results.Ok(userProfile);
});

// Transfer endpoints
app.MapPost("/make-transfer", [Authorize] async (HttpContext httpContext, TransferRequestDto requestDto, FinanceApiContext db) => {
    var userId = httpContext.User.FindFirstValue("uid");

    var sender = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);

    if (sender == null) {
        return Results.NotFound("Sender not found.");
    }

    var receiver = await db.Users.FirstOrDefaultAsync(u => u.AccountNumber == requestDto.ReceiverAccountNumber);

    if (receiver == null) {
        return Results.NotFound("Receiver not found.");
    }

    if (sender.Balance < requestDto.Amount) {
        return Results.BadRequest("Insufficient balance.");
    }

    sender.Balance -= requestDto.Amount;
    receiver.Balance += requestDto.Amount;

    var transfer = new Transfer {
        SenderId = sender.Id,
        ReceiverId = receiver.Id,
        Amount = requestDto.Amount,
        TransferDate = DateTime.Now
    };

    db.Transfers.Add(transfer);
    await db.SaveChangesAsync();

    return Results.Ok("Transfer successful.");
});


app.MapGet("/transfers", [Authorize] async (FinanceApiContext db) => {
    var transfers = await db.Transfers.ToListAsync();
    return Results.Ok(transfers);
});

app.MapGet("/transfers/{id}", [Authorize] async (int id, FinanceApiContext db) => {
    var transfer = await db.Transfers.FindAsync(id);

    if (transfer == null) {
        return Results.NotFound("Transfer not found.");
    }

    return Results.Ok(transfer);
});

app.MapPut("/transfers/{id}", [Authorize] async (int id, Transfer updatedTransfer, FinanceApiContext db) => {
    var transfer = await db.Transfers.FindAsync(id);

    if (transfer == null) {
        return Results.NotFound("Transfer not found.");
    }

    transfer.Amount = updatedTransfer.Amount;
    transfer.SenderId = updatedTransfer.SenderId;
    transfer.ReceiverId = updatedTransfer.ReceiverId;

    await db.SaveChangesAsync();

    return Results.Ok(transfer);
});

app.MapDelete("/transfers/{id}", [Authorize] async (int id, FinanceApiContext db) => {
    var transfer = await db.Transfers.FindAsync(id);

    if (transfer == null) {
        return Results.NotFound("Transfer not found.");
    }

    db.Transfers.Remove(transfer);
    await db.SaveChangesAsync();

    return Results.Ok("Transfer deleted.");
});

// Transaction endpoints
app.MapPost("/make-transaction", [Authorize] async (HttpContext httpContext, TransactionRequestDto requestDto, FinanceApiContext db) => {
    var userId = httpContext.User.FindFirstValue("uid");  
    if (userId == null) {
        return Results.NotFound("User ID not found.");
    }

    var user = await db.Users.FindAsync(userId);

    if (user == null) {
        return Results.NotFound("User not found.");
    }

    var transaction = new Transaction {
        UserId = userId,
        Amount = requestDto.Amount,
        Category = requestDto.Category,
        Description = requestDto.Description,
        TransactionDate = DateTime.Now
    };

    db.Transactions.Add(transaction);
    await db.SaveChangesAsync();

    return Results.Ok("Transaction recorded.");
});

app.MapGet("/transactions", [Authorize] async (FinanceApiContext db) => {
    var transactions = await db.Transactions.ToListAsync();
    return Results.Ok(transactions);
});

app.MapGet("/transactions/{id}", [Authorize] async (int id, FinanceApiContext db) => {
    var transaction = await db.Transactions.FindAsync(id);

    if (transaction == null) {
        return Results.NotFound("Transaction not found.");
    }

    return Results.Ok(transaction);
});

app.MapPut("/transactions/{id}", [Authorize] async (int id, Transaction updatedTransaction, FinanceApiContext db) => {
    var transaction = await db.Transactions.FindAsync(id);

    if (transaction == null) {
        return Results.NotFound("Transaction not found.");
    }

    transaction.Amount = updatedTransaction.Amount;
    transaction.Category = updatedTransaction.Category;
    transaction.Description = updatedTransaction.Description;

    await db.SaveChangesAsync();

    return Results.Ok(transaction);
});

app.MapDelete("/transactions/{id}", [Authorize] async (int id, FinanceApiContext db) => {
    var transaction = await db.Transactions.FindAsync(id);

    if (transaction == null) {
        return Results.NotFound("Transaction not found.");
    }

    db.Transactions.Remove(transaction);
    await db.SaveChangesAsync();

    return Results.Ok("Transaction deleted.");
});

// User endpoints
app.MapGet("/users", [Authorize] async (FinanceApiContext db) => {
    var users = await db.Users.ToListAsync();
    return Results.Ok(users);
});

app.MapGet("/users/{id}", [Authorize] async (string id, FinanceApiContext db) => {
    var user = await db.Users.FindAsync(id);

    if (user == null) {
        return Results.NotFound("User not found.");
    }

    return Results.Ok(user);
});

app.MapPut("/users/{id}", [Authorize] async (string id, UpdateUserDto updatedUser, FinanceApiContext db) => {
    var user = await db.Users.FindAsync(id);

    if (user == null) {
        return Results.NotFound("User not found.");
    }

    user.Email = updatedUser.Email;
    user.Balance = updatedUser.Balance;

    await db.SaveChangesAsync();

    return Results.Ok(user);
});

app.MapDelete("/users/{id}", [Authorize] async (string id, UserManager<ApplicationUser> userManager) => {
    var user = await userManager.FindByIdAsync(id);

    if (user == null) {
        return Results.NotFound("User not found.");
    }

    var result = await userManager.DeleteAsync(user);

    if (!result.Succeeded) {
        return Results.BadRequest(result.Errors);
    }

    return Results.Ok("User deleted.");
});

app.MapGet("/mytransactions", [Authorize] async (HttpContext httpContext, FinanceApiContext db) => {
    var userId = httpContext.User.FindFirstValue("uid");

    var transactions = db.Transactions.Where(transaction => transaction.UserId == userId);

    if (transactions == null) {
        return Results.NotFound("No transactions found");
    }

    return Results.Ok(transactions);
});

app.MapGet("/mytransfers", [Authorize] async (HttpContext httpContext, FinanceApiContext db) => {
    var userId = httpContext.User.FindFirstValue("uid");

    var transfers = await db.Transfers
        .Include(t => t.Sender)
        .Include(t => t.Receiver)
        .Where(t => t.SenderId == userId || t.ReceiverId == userId)
        .Select(t => new {
            t.Id,
            SenderAccountNumber = t.Sender.AccountNumber,
            ReceiverAccountNumber = t.Receiver.AccountNumber,
            t.Amount,
            t.TransferDate
        })
        .ToListAsync();

    if (!transfers.Any()) {
        return Results.NotFound("No transfers found");
    }

    return Results.Ok(transfers);
});


app.Run();
