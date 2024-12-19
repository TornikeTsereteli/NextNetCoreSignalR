using System.ComponentModel.DataAnnotations;

namespace GioStartapp.Application.DTOs;

public class RegisterDTO
{
    [Required]
    public string FirstName { get; set; }
    
    [Required]
    public string Lastname { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [MinLength(6,ErrorMessage = "Password should be at least 6 characted")]
    public string Password { get; set; }
    
    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; }

}