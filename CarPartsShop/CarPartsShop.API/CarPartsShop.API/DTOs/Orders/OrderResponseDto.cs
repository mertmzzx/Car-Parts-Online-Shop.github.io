namespace CarPartsShop.API.DTOs.Orders
{
    public class OrderItemResponseDto
    {
        public int PartId { get; set; }
        public string PartName { get; set; } = default!;
        public string Sku { get; set; } = default!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class OrderStatusHistoryDto
    {
        public string Status { get; set; } = default!;
        public DateTime ChangedAt { get; set; }
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = default!;
        public List<OrderItemResponseDto> Items { get; set; } = new();
        public List<OrderStatusHistoryDto>? StatusHistory { get; set; }

        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public string DeliveryAddress { get; set; } = "";
    }
}
