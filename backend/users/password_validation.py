import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы одну заглавную букву."),
                code='password_no_uppercase'
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы одну строчную букву."),
                code='password_no_lowercase'
            )
        if not re.search(r'\d', password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы одну цифру."),
                code='password_no_digit'
            )
        if not re.search(r'[@$!%*?&]', password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы один специальный символ (@, $, !, %, *, ?, &)."),
                code='password_no_special'
            )

    def get_help_text(self):
        return _(
            "Ваш пароль должен содержать хотя бы одну заглавную букву, "
            "одну строчную букву, одну цифру и один специальный символ (@$!%*?&)."
        )
