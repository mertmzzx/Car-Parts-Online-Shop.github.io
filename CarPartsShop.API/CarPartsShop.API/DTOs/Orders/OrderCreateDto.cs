using System.ComponentModel.DataAnnotations;

namespace CarPartsShop.API.DTOs.Orders
{
    public class OrderCreateDto
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Order must contain at least one item")]
        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();

    }
}
