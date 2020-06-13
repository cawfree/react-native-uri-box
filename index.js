import React, {useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import {ActivityIndicator, View, Image, StyleSheet} from "react-native";
import {typeCheck} from "type-check";
import useDeepCompareEffect from "use-deep-compare-effect";

const getMimeType = (uri, method) => new Promise(
  (resolve, error) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, uri);
    Object.assign(
      xhttp,
      {
        onreadystatechange: function () {
          if (this.readyState == this.DONE) {
            return resolve(this.getResponseHeader('Content-Type'));
          }
        },
        error,
      },
    );
    xhttp.send();
  },
);


const ImageComponent = ({ ...extraProps }) => (
  <Image
    resizeMode="cover"
    {...extraProps}
  />
);

export const LookUpTable = {
  ['image/png']: ImageComponent, 
  ['image/jpg']: ImageComponent, 
  ['image/jpeg']: ImageComponent,
  ['image/gif']: ImageComponent, 
  ['image/webp']: ImageComponent,
};

const styles = StyleSheet.create({container: {flex: 1}});

const UriBox = ({ Component, style, LoadingComponent, UnsupportedComponent, source, lookUpTable, optimized, inefficient, ...extraProps }) => {
  const [mimeType, setMimeType] = useState(null);
  const [{width, height}, setLayout] = useState({width: 0, height: 0});
  const onLayout = useCallback(
    ({nativeEvent: {layout}}) => setLayout(layout),
  );
  useDeepCompareEffect(
    () => {
      if (typeCheck("{uri:String,...}", source)) {
        const {uri} = source;
        return getMimeType(uri, inefficient ? "GET" : "HEAD")
          .then((mimeType) => {
            if (typeCheck("String", mimeType)) {
              return setMimeType(mimeType);
            }
            return Promise.reject(new Error(`${uri} does not support the HEAD request.`));
          })
          && undefined;
      }
      return undefined;
    },
    [source, setMimeType, inefficient],
  );
  const Implementation = lookUpTable[mimeType];
  const sourceIsKnown = typeCheck("String", mimeType) && typeCheck("Function", Implementation);
  return (
    <Component
      style={style}
      onLayout={onLayout}
    >
      {(!!sourceIsKnown) && (
        <Implementation
          style={{
            width,
            height,
          }}
          {...extraProps}
          source={source}
        />
      )}
      {(!sourceIsKnown && mimeType) && (
        <UnsupportedComponent
          source={source}
        />
      )}
      {(!sourceIsKnown && (!!source)) && (
        <LoadingComponent
        />
      )}
    </Component>
  );
};

UriBox.propTypes = {
  Component: PropTypes.elementType,
  LoadingComponent: PropTypes.elementType,
  UnsupportedComponent: PropTypes.elementType,
  style: PropTypes.shape({}),
  source: PropTypes.oneOfType([PropTypes.shape({uri: PropTypes.string.isRequired})]),
  lookUpTable: PropTypes.shape({}),
  inefficient: PropTypes.bool,
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
  inefficient: false,
};

export default UriBox;
