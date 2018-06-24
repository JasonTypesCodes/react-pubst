import {Component, createElement} from 'react';

import pubst from 'pubst';

const DEFAULT_CONFIG = {
  topic: '',
  default: undefined,
  doPrime: true,
  allowRepeats: false
};

function pubstWrappedComponentBuilder(componentToWrap, subMap) {

  class PubstWrappedComponent extends Component {
    constructor() {
      super();
      this.state = {};

      this.subConfigs = {};

      Object.keys(subMap).forEach(propName => {
        const passedConfig = subMap[propName];

        const subConfig = {};
        if (typeof passedConfig === 'object') {
          Object.keys(passedConfig).forEach(configItem => {
            if (DEFAULT_CONFIG.hasOwnProperty(configItem)) {
              subConfig[configItem] = passedConfig[configItem];
            }
          });
        } else if (typeof passedConfig === 'string' || passedConfig instanceof RegExp) {
          subConfig.topic = passedConfig;
        } else {
          throw new Error(`Pubst subscriber components must be configured with a string, regular expression, or object.  Received '${passedConfig}' for prop '${propName}'`);
        }

        Object.keys(DEFAULT_CONFIG).forEach(configItem => {
          if (!subConfig.hasOwnProperty(configItem)) {
            subConfig[configItem] = DEFAULT_CONFIG[configItem];
          }
        });

        subConfig.handler = (value) => {
          const stateUpdate = {};
          stateUpdate[propName] = value;
          this.setState(stateUpdate);
        }

        this.subConfigs[propName] = subConfig;

        this.state[propName] = pubst.currentVal(subConfig.topic, subConfig.default);
      });

      this.wrapped = componentToWrap;
      this.subMap = subMap;
      this.unsubs = [];
    }

    componentDidMount() {
      Object.keys(this.subConfigs).forEach(propName => {
        const subConfig = this.subConfigs[propName];
        this.unsubs.push(
          pubst.subscribe(
            subConfig.topic,
            subConfig
          )
        );
      });
    }

    componentWillUnmount() {
      this.unsubs.forEach(unsub => unsub());
    }

    render() {
      const newProps = {};
      Object.keys(this.props).forEach(prop => newProps[props] = this.props[prop]);
      Object.keys(this.state).forEach(key => newProps[key] = this.state[key]);
      console.log('Rendering: ', newProps);
      return createElement(this.wrapped, newProps);
    }
  }

  return PubstWrappedComponent;
}

export function subscriber(componentToWrap, subMap) {
  return pubstWrappedComponentBuilder(componentToWrap, subMap);
}
