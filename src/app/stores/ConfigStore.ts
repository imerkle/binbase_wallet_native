import { observable, action, runInAction } from 'mobx';
import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';
import configjson from 'app/constants/test_config.ts'
export class ConfigStore {
    @observable config = {};
    constructor() {
        this.init();
    }
    init = () => {
        const storage = new Storage({
            size: 1000,
            storageBackend: AsyncStorage,
            defaultExpires: null,
            enableCache: true,
            sync: {
            }
        });
        global.storage = storage;
    }
    getKey = async (key) => {
        return await global.storage.load({
                key,
        });
    }
    setKey = async (key, data) => {
        await global.storage.save({
            key,
            data,
        });
    }
    @action
    storeConfig = () => {
        let config = configjson;
        this.config = config;
        this.setKey('config', config);
    }
    @action
    setConfig = async () => {
        let res;
        try {
            res = await this.getKey('config')
            runInAction(() => {
                this.config = res;
            });
        } catch (e) {
            this.storeConfig();
        }
    };
}

export default ConfigStore;