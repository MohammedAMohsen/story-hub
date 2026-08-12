from djoser.email import ActivationEmail, PasswordResetEmail
from .tasks import send_activation_email, send_reset_password_email


class CeleryActivationEmail(ActivationEmail):
    def send(self, to, *args, **kwargs):
        user = self.context["user"]
        send_activation_email.delay(user.pk)


class CeleryPasswordResetEmail(PasswordResetEmail):
    def send(self, to, *args, **kwargs):
        user = self.context["user"]
        send_reset_password_email.delay(user.pk)