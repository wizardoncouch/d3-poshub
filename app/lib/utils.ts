import { Bounce, toast } from "react-toastify";

export const error = (text: string) => {
    toast.error(text, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        theme: 'colored',
        transition: Bounce,
        pauseOnFocusLoss: false,
        pauseOnHover: false
    });
};
export const success = (text: string) => {
    toast.success(text, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        theme: 'colored',
        transition: Bounce,
        pauseOnFocusLoss: false,
        pauseOnHover: false
    });
};

export const moneyFormat = (amount: number, currency: string = 'PHP'): string => {
    const format = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return format.format(amount);
}