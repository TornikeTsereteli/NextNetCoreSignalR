using Microsoft.AspNetCore.SignalR;

namespace GioStartapp.Hubs;

public class ChatHub : Hub
{
    private static readonly List<UserMessage> ChatHistory = [];

    public List<UserMessage> GetChatHistory()
    {
        return ChatHistory;
    }
    
    public async Task SendMessage(string user, string message)
    {
        Console.WriteLine(user + ": " + message);
        ChatHistory.Add(new UserMessage()
        {
            Message = message,
            User = Context.User.Identity.Name,
        });
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
    
    public class UserMessage
    {
        public string Message { get; set; }
        public string User { get; set; }
    }
}

