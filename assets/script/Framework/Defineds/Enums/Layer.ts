export namespace Layer {
    export enum GameLayer {
        //内容层
        Content = 0,
        Mask,
        Tips,
        Alert,
        Loading,
        UILoading
    }

    export const GameLayerNames: string[] = [
        "LayerContent", "Mask", "Tips", "Alert", "Loading", "UILoading"
    ]
}