using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace ApplyPannuBro.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpSettings = _config.GetSection("SmtpSettings");
            var host = smtpSettings.GetValue<string>("Host");
            var port = smtpSettings.GetValue<int>("Port");
            var enableSsl = smtpSettings.GetValue<bool>("EnableSsl");
            var username = smtpSettings.GetValue<string>("Username");
            var password = smtpSettings.GetValue<string>("Password");
            var senderEmail = smtpSettings.GetValue<string>("SenderEmail");
            var senderName = smtpSettings.GetValue<string>("SenderName");

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username))
            {
                Console.WriteLine($"[EmailService] SMTP not fully configured. Email to {toEmail} skipped. Subject: {subject}");
                return;
            }

            using (var client = new SmtpClient(host, port))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(username, password);
                client.EnableSsl = enableSsl;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail ?? username, senderName ?? "Apply Pannu Bro"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
