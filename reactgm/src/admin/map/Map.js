import React, { Component } from "react";
import axios from "axios";

const gm = window.gm;
const google = window.google; // error with google undefined when reloading NGI emulator

class Map extends Component {
  state = {};

  containerRef = React.createRef(); // creates the empty box that React will fill with an element

  processVehicleData = data => {
    const { parkingData } = this.state;
    const position = parkingData.map(item => ({
      lat: item.Latitude,
      lng: item.Longitude
    }));
    console.log(position);
    this.setState({ position: position.map(item => item) });

    console.log("Data", data);

    if (this.state.useKMH) {
      var average_speed = data.average_speed;
    } else {
      var average_speed = Math.round(data.average_speed * 0.621); // convert from kmh to mph
    }

    gm.info.getCurrentPosition(pos => {
      var latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      this.setState({ lat });
      this.setState({ lng });
      this.initMap(latLng);
    }, true);

    this.setState({
      average_speed: average_speed
    });
  };

  directionMap = () => {
    const LatLng = this.state.position;
    const latLng = this.state.latLng;
    const parkingData = this.state.parkingData;
    console.log(parkingData);
    console.log(LatLng);
    var map = new window.google.maps.Map(this.containerRef.current, {
      zoom: 15,
      center: {
        lat: 34.053486,
        lng: -118.24248
      }
    });
    const city = parkingData.filter(data => {
      return data.Spaces > 1;
    });
    LatLng.map(item => {
      var marker = new window.google.maps.Marker({
        position: item,
        map: map,
        label: "P",
        animation: window.google.maps.Animation.DROP
      });
    });
  };

  initMap = latLng => {
    // this function creates a map with marker using the coordinates passed in
    this.setState({ latLng: latLng });
    var map = new window.google.maps.Map(this.containerRef.current, {
      zoom: 14,
      center: latLng
    });
    var marker = new window.google.maps.Marker({
      position: latLng,
      map: map,
      label: "Car",
      animation: window.google.maps.Animation.DROP
    });
  };

  componentDidMount() {
    const vin = gm.info.getVIN();

    this.setState({ vin });

    //  do continuous query of the car’s systems; think of it like a listener for signal values
    axios
      .get(
        "https://api.go511.com/api/parkandridelots?key=93a61394a8eeae835f7d4b7a0d3597cd&format=json"
      )
      .then(res => {
        console.log(res);
        this.setState({ parkingData: res.data });
        const vehicleData = gm.info.watchVehicleData(this.processVehicleData, [
          "average_speed",
          "gps_long",
          "gps_lat",
          "gear_automatic"
        ]);
      });
  }
  handleDestination = () => {
    const dest = { address: this.state.destination };
    console.log(dest);
    gm.nav.setDestination(set => {
      console.log("set===", set);
    }, dest);
    gm.nav.getDestination(get => {
      console.log("get===", get);
    }, true);
    // const lat = this.state.lat;
    // const lng = this.state.lng;
    // const destination = encodeURI(this.state.destination);
    // console.log(destination);
    // axios
    //   .get(
    //     `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${destination}&mode=transit&key=AIzaSyAaqxl4Rve6wjojceW0oC6mXRoDjObVNE0`
    //   )
    //   .then(response => {
    //     var directionsDisplay = new google.maps.DirectionsRenderer();
    //     var directionService = new google.maps.DirectionsService();
    //     directionService.route(directionsDisplay.setDirections(response));
    //   });
  };
  handleDestinationAddress = e => {
    const destination = e.target.value;
    this.setState({ destination });
  };
  handleClose = () => {
    gm.system.closeApp();
  };

  render() {
    return (
      <div className="">
        <button onClick={() => this.handleDestination()}>Destination</button>
        <button onClick={() => this.directionMap()}>
          Check Parking Available
        </button>
        <button onClick={this.props.handleListLocation} />
        <div
          style={{
            padding: "2px",
            margin: "2px",
            width: "100%",
            height: "100vh"
          }}
          ref={this.containerRef}
        />
        <div />
      </div>
    );
  }
}

export default Map;
