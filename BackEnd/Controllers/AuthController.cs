using System.Security.Claims;
using GioStartapp.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace GioStartapp.Controllers;
[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IEmailSender<IdentityUser> _emailSender;

    public AuthController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager,IEmailSender<IdentityUser> emailSender)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailSender = emailSender;
    }


    [HttpPost("/register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
    {
        Console.WriteLine(registerDto.Email);
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        IdentityUser user = new IdentityUser()
        {
            UserName = registerDto.FirstName + registerDto.Lastname,
            Email = registerDto.Email
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {

            await _userManager.AddToRoleAsync(user, "User");
            
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var confirmationLink = Url.Action(
                "ConfirmEmail", 
                "Auth", 
                new { userId = user.Id, token }, 
                Request.Scheme);

            await _emailSender.SendConfirmationLinkAsync(user, user.Email, confirmationLink);
            
            
            return Ok(new
            {
                Message = "Registration successful, please check yor email"
            });
        }

        return BadRequest(result.Errors);
    }
    
    [HttpGet("/confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            return BadRequest("Invalid email confirmation request.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            return Ok(new { Message = "Email confirmed successfully!" });
        }

        return BadRequest("Email confirmation failed.");
    }


    [HttpPost("/send-verification-notification")]
    public async Task<IActionResult> SendVerificationNotification([FromBody] string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { Message = "Email is required." });

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return NotFound(new { Message = "User not found." });

        if (await _userManager.IsEmailConfirmedAsync(user))
            return BadRequest(new { Message = "Email is already confirmed." });

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmationLink = Url.Action(
            "ConfirmEmail",
            "Auth",
            new { userId = user.Id, token },
            Request.Scheme);
        await _emailSender.SendConfirmationLinkAsync(user, user.Email, confirmationLink);

        return Ok(new { Message = "Verification email sent successfully." });
    }



    [HttpGet("/test")]
    public int test()
    {
        return 1;
    }


    



    [HttpPost("/login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userManager.FindByEmailAsync(loginDto.Email);

        if (user == null)
        {
            Console.WriteLine("Im here");
            return Unauthorized("Invalid Email or Password");
        }
        
        if (!await _userManager.IsEmailConfirmedAsync(user))
        {
            Console.WriteLine("emaill >!=?!??????");
            return Unauthorized("Please confirm your email before logging in.");
        }

        var result = await _signInManager.PasswordSignInAsync(user.UserName, loginDto.Password, false, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            return Ok("Login Successful");
        }
        
        if (result.IsLockedOut)
        {
            return Unauthorized("Your account is locked due to too many failed login attempts.");
        }

        return Unauthorized("Invalid email or password.");
    }

    [HttpPost("/logout")]
    public async Task<IActionResult> LogOut()
    {
        await _signInManager.SignOutAsync();
        return Ok(new
        {
            Message = "Successfully Logged Out"
        });    
    }

    [Authorize(Roles = "User")]
    [HttpGet("/user")]
    public async Task<IActionResult> UserPage()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userName = User.Identity?.Name;
        bool isEmailConfirmed = false;
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            isEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);

        }
        catch (Exception e)
        {
        }
        return Ok(new
        {
            Id = userId,
            Email = userEmail,
            Username = userName,
            IsVerified = isEmailConfirmed,
            Message = "Welcome to your page!"
            
        });
    }

    
    
    
    
    
}