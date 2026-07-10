using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ApplyPannuBro.Hubs
{
    public class LiveUpdateHub : Hub
    {
        public async Task NotifyUpdate(string entityName)
        {
            await Clients.All.SendAsync("ReceiveUpdate", entityName);
        }
    }
}
