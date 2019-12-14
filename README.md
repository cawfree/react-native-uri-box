# react-native-uri-box
An extendible React &lt;Component/> which will attempt to render source content consistently, based on the MIME type.

## 🚀 Getting Started

Using [`npm`]():

```sh
yarn add react-native-uri-box
```

Using [`yarn`]():

```sh
yarn add react-native-uri-box
```

## ✍️ Example
Just use this as a drop-in component for your remote content:

```javascript
import UriBox, { LookUpTable } from 'react-native-uri-box';
import Video from 'react-native-video';

const App = () => (
  <UriBox
    style={{
      flex: 1,
    }}
    source={{
      // XXX: The content type is determined from the source.
      uri: 'http://www.cawfree.com/mapsy/img/mapsy.jpg',
    }}
    lookUpTable={{
      // XXX: The lookUpTable can be used to add support for
      //      additional MIME types.
      ...LookUpTable,
      ['video/mp4']: ({ ...extraProps }) => (
        <Video
          {...extraProps}
          resizeMode="cover"
          loop
          muted
        />
      ),
    }}
  />
);
```

## 📌 Prop Types

Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
Component|custom|no|View| Defines the parent <Component/> for your content. As an example, you could pass an `<Animated.View` to permit animation.
LoadingComponent|custom|no|ActivityIndicator|What <Component /> to render whilst loading.
UnsupportedComponent|custom|no|&lt;See the source code&gt;|What <Component /> to render if the requested MIME type is not supported.
style|shape|no|styles.container| Parent component styling. The dynamic contents will be sized to fill this <View/>.
source|union|no|null|What source to render; expects an object with a single key `uri`.
lookUpTable|shape|no|&lt;See the source code&gt;|Defines the table of mappings to determine which components are used for which MIME types.
-----

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)

## [@cawfree](https://twitter.com/cawfree)

Open source takes a lot of work! If this project has helped you, please consider [buying me a coffee](https://www.buymeacoffee.com/cawfree). ☕ 

<p align="center">
  <a href="https://www.buymeacoffee.com/cawfree">
    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy @cawfree a coffee" width="232" height="50" />
  </a>
</p>
