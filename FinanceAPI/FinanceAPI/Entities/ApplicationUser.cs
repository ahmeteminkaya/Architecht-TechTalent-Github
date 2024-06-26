using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Entities {
    public class ApplicationUser : IdentityUser {
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        public string AccountNumber { get; set; }
    }
}
