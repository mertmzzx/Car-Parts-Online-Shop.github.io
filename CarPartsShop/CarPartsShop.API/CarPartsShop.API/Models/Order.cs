using System.ComponentModel.DataAnnotations;
using CarPartsShop.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarPartsShop.API.Models
{
    public class Order
    {
        public int Id { get; set; }

        // FK
        [Required]
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Totals
        [Precision(18, 2)]
        public decimal Subtotal { get; set; }

        [Precision(18, 2)]
        public decimal Tax { get; set; }

        [Precision(18, 2)]
        public decimal Total { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();


        [Timestamp]
        public byte[]? RowVersion { get; set; }


        // Shipping snapshot – captures the address used at the time of checkout

        public string? ShipFirstName { get; set; }
        public string? ShipLastName { get; set; }
        public string? ShipAddressLine1 { get; set; }
        public string? ShipAddressLine2 { get; set; }
        public string? ShipCity { get; set; }
        public string? ShipState { get; set; }
        public string? ShipPostalCode { get; set; }
        public string? ShipCountry { get; set; }
        public string? ShipPhone { get; set; }

        public string ShippingMethod { get; set; } = "Standard";
    }
}
