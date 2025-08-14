using System.ComponentModel.DataAnnotations;

namespace CarPartsShop.API.DTOs.Orders
{
    public class OrderItemCreateDto
    {
        [Required]
        public int PartId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}
