import {Component, createElement} from 'react';

import pubst from 'pubst';

function pubstWrappedComponentBuilder(componentToWrap, subMap) {

  class PubstWrappedComponent extends Component {
    constructor() {
      super();
      this.state = {};

      Object.keys(subMap).forEach(propName => {
        this.state[propName] = pubst.currentVal(subMap[propName]);
      });

      this.wrapped = componentToWrap;
      this.subMap = subMap;
      this.unsubs = [];
    }

    componentDidMount() {
      Object.keys(this.subMap).forEach(propName => {
        this.unsubs.push(
          pubst.subscribe(
            this.subMap[propName],
            (value) => {
              if (value !== this.state[propName]) {
                const stateUpdate = {};
                stateUpdate[propName] = value;
                this.setState(stateUpdate);
              }
            }
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
