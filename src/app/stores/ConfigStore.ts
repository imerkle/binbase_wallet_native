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

    setMnemonic = (mnemonic) => {
        global.storage.save({
            key: 'mnemonic',
            data: mnemonic,
        });
    }
    getMnemonic = async () => {
        let res;
        try {
            res = await global.storage.load({
                key: 'mnemonic',
            });
        } catch (e) { }
        return res;
    }
    @action
    storeConfig = () => {
        let config = configjson;
        this.config = config;
        global.storage.save({
            key: 'config',
            data: config,
        });
    }
    @action
    setConfig = async () => {
        let res;
        try {
            res = await global.storage.load({
                key: 'config',
            });
            runInAction(() => {
                this.config = res;
            });
        } catch (e) {
            this.storeConfig();
        }
    };
}

export default ConfigStore;