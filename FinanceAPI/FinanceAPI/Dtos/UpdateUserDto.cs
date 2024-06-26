using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Dtos {
    public class UpdateUserDto {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }
    }
}