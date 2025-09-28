using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace CarPartsShop.API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        // FKs
        [Required]
        public int OrderId { get; set; }
        public Order? Order { get; set; }

        [Required]
        public int PartId { get; set; }
        public Part? Part { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        // Price captured at time of purchase
        [Precision(18, 2)]
        public decimal UnitPrice { get; set; }
    }
}
