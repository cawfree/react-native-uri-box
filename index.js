import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { lookup } from 'react-native-mime-types';

const styles = StyleSheet
  .create(
    {
      container: {
        flex: 1,
      },
    },
  );

const ImageComponent = ({ ...extraProps }) => (
  <Image
    {...extraProps}
    resizeMode="cover"
  />
);

export const LookUpTable = {
  ['image/png']: ImageComponent, 
  ['image/jpg']: ImageComponent, 
  ['image/jpeg']: ImageComponent,
  ['image/gif']: ImageComponent, 
  ['image/webp']: ImageComponent,
};

class UriBox extends React.Component {
  static isSourceKnown = (lookUpTable, mime) => (
    typeof lookUpTable === 'object' && typeof mime === 'string' && typeof lookUpTable[mime] === 'function'
  );
  constructor(props) {
    super(props);
    this.__onLayout = this.__onLayout.bind(this);
    this.state = {
      width: undefined,
      height: undefined,
      mime: undefined,
    };
  }
  async componentDidMount() {
    const { source } = this.props;
    if (!!source) {
      return this.__shouldUpdateSource(source)
        .catch(console.warn);
    }
    return Promise
      .resolve();
  }
  async componentWillUpdate(nextProps, nextState) {
    const { source } = nextProps;
    if (!!source && (source !== this.props.source)) {
      return this.__shouldUpdateSource(source)
        .catch(console.warn);
    }
    return Promise
      .resolve();
  }
  __shouldUpdateSource(source) {
    return new Promise(
      resolve => this.setState(
        {
          mime: null,
        },
        resolve,
      ),
    )
      .then(() => this.__getMimeType(
        source,
      ))
      .then(mime => this.setState({
        mime,
      }));
  }
  __getMimeType(source) {
    if (typeof source === 'object') {
      const { uri } = source;
      if (typeof uri === 'string') {
        return axios(
          {
            method: 'get',
            url: uri,
          },
        )
          .then(({ headers }) => {
            const { 'content-type': contentType } = headers;
            return contentType;
          });
      }
    }
    return Promise
      .reject(
        new Error(
          `Unable to evaluate source! (${JSON.stringify(
            source,
          )})`,
        ),
      );
  }
  __onLayout(e) {
    const {
      width,
      height,
    } = e.nativeEvent.layout;
    return this.setState(
      {
        width,
        height,
      },
    );
  }
  render() {
    const {
      Component,
      LoadingComponent,
      UnsupportedComponent,
      lookUpTable,
      style,
      ...extraProps
    } = this.props;
    const { source } = extraProps;
    const {
      width,
      height,
      mime,
    } = this.state;
    const sourceIsKnown = UriBox
      .isSourceKnown(
        lookUpTable,
        mime,
      );
    const Implementation = lookUpTable[mime];
    return (
      <Component
        style={style}
        onLayout={this.__onLayout}
      >
        {(!!sourceIsKnown) && (
          <Implementation
            style={{
              width,
              height,
            }}
            {...extraProps}
          />
        )}
        {(!sourceIsKnown && mime) && (
          <UnsupportedComponent
          />
        )}
        {(!sourceIsKnown && (!!source)) && (
          <LoadingComponent
          />
        )}
      </Component>
    );
  }
}

UriBox.propTypes = {
  Component: PropTypes.elementType,
  LoadingComponent: PropTypes.elementType,
  UnsupportedComponent: PropTypes.elementType,
  style: PropTypes.shape({}),
  source: PropTypes.oneOfType(
    [
      // TODO: Support requires, too.
      PropTypes.shape(
        {
          uri: PropTypes.string.isRequired,
        },
      ),
    ],
  ),
  lookUpTable: PropTypes.shape({}),
};

UriBox.defaultProps = {
  Component: View,
  LoadingComponent: ActivityIndicator,
  UnsupportedComponent: ({ ...extraProps }) => (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: 'lightgrey',
      }}
    />
  ),
  style: styles.container,
  source: null,
  lookUpTable: LookUpTable,
};

export default UriBox;
