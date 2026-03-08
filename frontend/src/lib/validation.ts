/**
 * Validates an email address and checks for common domain typos.
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
    if (!email) return { isValid: false, message: 'El correo es requerido' };

    // Standard RFC 5322 regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'El formato del correo no es válido' };
    }

    const domain = email.split('@')[1].toLowerCase();

    // Typo detection for common domains
    const commonTypos: Record<string, string> = {
        'gimail.com': 'gmail.com',
        'gimal.com': 'gmail.com',
        'gmail.co': 'gmail.com',
        'gmial.com': 'gmail.com',
        'outlok.com': 'outlook.com',
        'outluk.com': 'outlook.com',
        'hotmal.com': 'hotmail.com',
        'hotmial.com': 'hotmail.com',
        'yahoo.co': 'yahoo.com',
    };

    if (commonTypos[domain]) {
        return {
            isValid: false,
            message: `¿Quisiste decir ${commonTypos[domain]}? Detectamos un posible error en el dominio.`
        };
    }

    return { isValid: true };
};
