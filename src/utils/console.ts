// 美化打印实现方法
const prettyLog = () => {
    const isEmpty = (value: string | null | undefined) => {
        return value == null || value === undefined || value === "";
    };
    const prettyPrint = (title: string, text: string, color: string) => {
        console.log(
            `%c ${title} %c ${text} %c`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 2px 2px 0; color: ${color};`,
            "background:transparent"
        );
    };
    const info = (textOrTitle: string, content = "") => {
        const title = isEmpty(content) ? "Info" : textOrTitle;
        const text = isEmpty(content) ? textOrTitle : content;
        prettyPrint(title, text, "#154EC1");
    };
    const error = (textOrTitle: string, content = "") => {
        const title = isEmpty(content) ? "Error" : textOrTitle;
        const text = isEmpty(content) ? textOrTitle : content;
        prettyPrint(title, text, "#F56C6C");
    };
    const warning = (textOrTitle: string, content = "") => {
        const title = isEmpty(content) ? "Warning" : textOrTitle;
        const text = isEmpty(content) ? textOrTitle : content;
        prettyPrint(title, text, "#E6A23C");
    };
    const success = (textOrTitle: string, content = "") => {
        const title = isEmpty(content) ? "Success " : textOrTitle;
        const text = isEmpty(content) ? textOrTitle : content;
        prettyPrint(title, text, "#67C23A");
    };

    const tip = (textOrTitle: string, content = "") => {
        const title = isEmpty(content) ? "Tip " : textOrTitle;
        const text = isEmpty(content) ? textOrTitle : content;
        prettyPrint(title, text, "#000000");
    };

    return {
        tip,
        info,
        error,
        warning,
        success,
    };
};

export const log = prettyLog();

export function debug(...args: any) {
   
    if (true) {
        console.log(...args);
    }
}

export function consoleError(...args: any) {
    if (true) {
        console.error(...args);
    }
}
