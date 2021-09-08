import { ModuleComponent, ModuleHideOption, ModuleShowOption } from "../../Framework/Component/ModuleComponent";

export default class PopupModule extends ModuleComponent {
    private _data: any = null

    protected get data() { return this._data }

    show(option: ModuleShowOption): void {
        this._data = option.data
        manager.popupControll.popup(this)
        option.onShowed()
    }
    hide(option: ModuleHideOption) { option.onHided() }
}
