using System.ComponentModel.DataAnnotations;

namespace GioStartapp.Application.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    public string Password { get; set; }
}