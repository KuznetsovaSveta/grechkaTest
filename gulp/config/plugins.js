import replace from "gulp-replace";//для поиска и замены
import plumber from "gulp-plumber";//обработка ошибок
import notify from "gulp-notify";//вывод сообщений
import browsersync from "browser-sync";//локальный сервер
import newer from "gulp-newer";
import ifPlugin from "gulp-if";



export const plugins = {
    replace: replace,
    plumber: plumber,
    notify: notify,
    browsersync: browsersync,
    newer: newer,
    if: ifPlugin,
}
