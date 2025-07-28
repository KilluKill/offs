<?php
/**
 * Email Test Script for 17yotk Server
 * Run this script to test email functionality
 */

// Test basic email sending
$to = 'admin@17yotk.net';
$subject = 'Test Email from 17yotk Server';
$message = 'This is a test email to verify email functionality is working.';
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: noreply@17yotk.net',
    'Reply-To: noreply@17yotk.net',
    'X-Mailer: PHP/' . phpversion()
];

echo "=== EMAIL TEST SCRIPT ===\n";
echo "Testing email functionality...\n";
echo "To: $to\n";
echo "Subject: $subject\n\n";

// Check if mail function exists
if (!function_exists('mail')) {
    echo "❌ ERROR: mail() function is not available!\n";
    echo "Please install and configure a mail server (sendmail, postfix, etc.)\n";
    exit(1);
}

echo "✅ mail() function is available\n";

// Try to send email
$result = mail($to, $subject, $message, implode("\r\n", $headers));

if ($result) {
    echo "✅ Email sent successfully!\n";
    echo "Check your email at: $to\n";
} else {
    echo "❌ Failed to send email\n";
    echo "Possible issues:\n";
    echo "1. Mail server not configured\n";
    echo "2. Domain not set up for sending emails\n";
    echo "3. Firewall blocking outgoing emails\n";
    echo "4. Invalid email addresses\n\n";
    
    echo "=== TROUBLESHOOTING ===\n";
    echo "1. Check PHP mail configuration:\n";
    echo "   - sendmail_path: " . ini_get('sendmail_path') . "\n";
    echo "   - SMTP: " . ini_get('SMTP') . "\n";
    echo "   - smtp_port: " . ini_get('smtp_port') . "\n\n";
    
    echo "2. Check server logs:\n";
    echo "   - /var/log/mail.log\n";
    echo "   - /var/log/syslog\n\n";
    
    echo "3. Alternative solutions:\n";
    echo "   - Use external SMTP service (Gmail, SendGrid, etc.)\n";
    echo "   - Configure webhook notifications\n";
    echo "   - Check /tmp/donations_*.log for backup logs\n";
}

echo "\n=== BACKUP LOG CHECK ===\n";
$log_file = '/tmp/donations_' . date('Y-m-d') . '.log';
if (file_exists($log_file)) {
    echo "✅ Backup log exists: $log_file\n";
    echo "Recent entries:\n";
    echo substr(file_get_contents($log_file), -500) . "\n";
} else {
    echo "ℹ️  No backup log found for today\n";
}

echo "\nTest completed.\n";
?>