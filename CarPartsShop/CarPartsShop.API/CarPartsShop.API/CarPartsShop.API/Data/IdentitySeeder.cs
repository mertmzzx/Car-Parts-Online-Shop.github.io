using CarPartsShop.API.Auth;
using CarPartsShop.API.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarPartsShop.API.Data
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(this IServiceProvider services, IConfiguration config)
        {
            using var scope = services.CreateScope();
            var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();
            var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

            // Create roles if not exist
            foreach (var role in new[] { Roles.Customer, Roles.SalesAssistant, Roles.Administrator })
            {
                if (!await roleMgr.RoleExistsAsync(role))
                    await roleMgr.CreateAsync(new AppRole { Name = role });
            }

            // Admin seed
            var adminCfg = config.GetSection("AdminSeed");
            var adminUserName = adminCfg["UserName"];
            var adminEmail = adminCfg["Email"];
            var adminPassword = adminCfg["Password"];

            if (!string.IsNullOrWhiteSpace(adminUserName) &&
                !string.IsNullOrWhiteSpace(adminEmail) &&
                !string.IsNullOrWhiteSpace(adminPassword))
            {
                var admin = await userMgr.FindByNameAsync(adminUserName);
                if (admin == null)
                {
                    admin = new AppUser
                    {
                        UserName = adminUserName,
                        Email = adminEmail,
                        FirstName = "Admin",
                        LastName = "User"
                    };
                    var result = await userMgr.CreateAsync(admin, adminPassword);
                    if (result.Succeeded)
                    {
                        await userMgr.AddToRoleAsync(admin, Roles.Administrator);
                    }
                }
            }

            // Optional: Seed SalesAssistant
            //var sales = await userMgr.FindByNameAsync("sales1");
            //if (sales == null)
            //{
            //    sales = new AppUser
            //    {
            //        UserName = "sales1",
            //        Email = "sales1@carparts.local",
            //        FirstName = "Sales",
            //        LastName = "Assistant"
            //    };
            //    var result = await userMgr.CreateAsync(sales, "Sales!23456");
            //    if (result.Succeeded)
            //    {
            //        await userMgr.AddToRoleAsync(sales, Roles.SalesAssistant);
            //    }
            //}

            // Optional: Seed Customer user for linking to Customer entity
            //var testUser = await userMgr.FindByEmailAsync("test@example.com");
            //if (testUser == null)
            //{
            //    testUser = new AppUser
            //    {
            //        UserName = "testuser",
            //        Email = "test@example.com",
            //        FirstName = "Test",
            //        LastName = "User"
            //    };
            //    var result = await userMgr.CreateAsync(testUser, "Test!23456");
            //    if (result.Succeeded)
            //    {
            //        await userMgr.AddToRoleAsync(testUser, Roles.Customer);
            //    }
            //}

        }
    }
}
