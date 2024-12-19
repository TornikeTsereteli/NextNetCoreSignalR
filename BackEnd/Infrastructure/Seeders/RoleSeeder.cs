using Microsoft.AspNetCore.Identity;

namespace GioStartapp.Infrastructure.Seeders;



public static class RoleSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();

        string[] roles = { "Admin", "User" };

        // Create roles
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // // Create an admin user
        // var adminEmail = "admin@example.com";
        // var adminPassword = "Admin@123";
        //
        // var adminUser = await userManager.FindByEmailAsync(adminEmail);
        // if (adminUser == null)
        // {
        //     adminUser = new IdentityUser() { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true };
        //     await userManager.CreateAsync(adminUser, adminPassword);
        //     await userManager.AddToRoleAsync(adminUser, "Admin");
        // }
    }
}