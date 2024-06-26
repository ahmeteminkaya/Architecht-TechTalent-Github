using FinanceAPI.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Entities {
    public class Transfer {
        public int Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime TransferDate { get; set; }
        public ApplicationUser Sender { get; set; }
        public ApplicationUser Receiver { get; set; }
    }
}
