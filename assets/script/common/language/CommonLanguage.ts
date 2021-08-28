import { LanguageZH } from "./LanguageZH";
import { LanguageEN } from "./LanguageEN";

export let i18n = LanguageZH;
export let COMMON_LANGUAGE_NAME: string;
export class CommonLanguage implements LanguageDataSourceDelegate {
    name = COMMON_LANGUAGE_NAME;
    data(language: string): LanguageData {
        if (i18n.language == language) {
            return i18n;
        }
        i18n = LanguageZH;
        if (language == LanguageEN.language) {
            i18n = LanguageEN;
        }
        //默认中文
        return i18n;
    }
}