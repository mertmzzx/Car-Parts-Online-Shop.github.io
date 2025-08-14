namespace CarPartsShop.API.DTOs.Orders
{
    public class OrderQueryParameters
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public decimal? MinTotal { get; set; }
        public decimal? MaxTotal { get; set; }
        public string? Status { get; set; }
    }
}
