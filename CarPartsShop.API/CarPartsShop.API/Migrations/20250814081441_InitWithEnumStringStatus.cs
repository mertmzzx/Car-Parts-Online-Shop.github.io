using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarPartsShop.API.Migrations
{
    /// <inheritdoc />
    public partial class InitWithEnumStringStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Orders",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 32);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Orders",
                type: "int",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32);
        }
    }
}
