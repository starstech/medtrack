# Page snapshot

```yaml
- img "medicine-box"
- img "heart"
- heading "MedTrack" [level=2]
- heading "Welcome Back" [level=2]
- text: Sign in to continue managing your family's healthcare with confidence 📋
- strong: Medication Tracking
- text: Never miss a dose again 💊
- strong: Smart Reminders
- text: Timely notifications for your family 📱
- strong: Sync Everywhere
- text: Access from any device, anytime
- heading "Sign In" [level=3]
- text: Enter your credentials to access your account
- alert:
  - img "close-circle"
  - text: Sign In Failed Invalid login credentials
  - button "close":
    - img "close"
- text: "* Email Address"
- img "mail"
- textbox "* Email Address"
- text: "* Password"
- img "lock"
- textbox "* Password"
- img "eye-invisible"
- button "Forgot your password?"
- button "Sign In"
- text: Don't have an account?
- link "Create one now":
  - /url: /register
```