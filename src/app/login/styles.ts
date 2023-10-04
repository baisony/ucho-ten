import { tv } from "@nextui-org/react";

export const createLoginPage = tv({
    slots: {
        background: 'w-full h-full fontFamily-[Noto Sans JP] text-white bg-black flex justify-center items-center',
        LoginForm: 'w-80 h-72 relative',
        LoginFormConnectServer: 'w-full h-[54px] flex items-center bg-neutral-700 bg-opacity-50 rounded-lg',
        LoginFormConnectServerInputArea: '',
        LoginFormHandleInputArea: '',
        LoginFormHandle: 'h-[64px] w-full flex items-center mt-[10px] border-b-[1px] border-[#727272]',
        LoginFormPassword: '',
        LoginFormLoginButton: 'w-80 h-14 bottom-[0px] absolute bg-neutral-700 bg-opacity-50 rounded-2xl flex items-center justify-center',
    },
    variants: {
        color:{
            light: {
                background: '',
                container: '',
            },
            dark: {
                //background: 'bg-cover bg-[url(/images/backgroundImage/dark/starry-sky-gf5ade6b4f_1920.jpg)]',
                background: 'bg-black',
                container: '',
            },
        },
        isMobile: {
            true: {
                background: "",
            },
            false: {
                background: "",
            },
        },
        error:{
            true:{
                LoginFormHandle: 'border-[#FF0000]',
            },
            false:{}
        }
    }
});