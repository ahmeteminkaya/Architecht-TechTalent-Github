using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Entities;

namespace FinanceAPI.Data {
    public class FinanceApiContext : IdentityDbContext<ApplicationUser> {
        public FinanceApiContext(DbContextOptions<FinanceApiContext> options) : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Transfer> Transfers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>(entity => {
                entity.Property(e => e.Balance)
                    .HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<Transaction>(entity => {
                entity.Property(e => e.Amount)
                    .HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<Transfer>(entity => {
                entity.Property(e => e.Amount)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(t => t.Sender)
                    .WithMany()
                    .HasForeignKey(t => t.SenderId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(t => t.Receiver)
                    .WithMany()
                    .HasForeignKey(t => t.ReceiverId)
                    .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
