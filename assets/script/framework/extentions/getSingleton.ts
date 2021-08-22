export function getSingleton<T>(cls: Singleton<T>) { return cls.Instance() }
