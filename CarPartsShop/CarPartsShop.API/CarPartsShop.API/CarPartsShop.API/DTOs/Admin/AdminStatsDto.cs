    namespace CarPartsShop.API.DTOs.Admin
    {
    public class AdminStatsDto
    {
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public decimal TotalRevenue { get; set; }
        public int LowStockCount { get; set; }
    }
}
