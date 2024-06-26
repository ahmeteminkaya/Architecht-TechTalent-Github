using FinanceAPI.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Entities {
    public class Transaction {
        public int Id { get; set; }
        public string UserId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string Category { get; set; }
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public ApplicationUser User { get; set; }
    }
}
