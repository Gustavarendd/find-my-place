import { Modal } from './UI/Modal';
import { Map } from './UI/Map';
import { getCoordsFromAddress, getAddressFromCoords } from './Utility/Location';

class PlaceFinder {
  constructor() {
    const addressForm = document.querySelector('form');
    const locateUserBtn = document.getElementById('locate-btn');
    this.shareBtn = document.getElementById('share-btn');

    this.shareBtn.addEventListener('click', this.sharePlaceHandler);
    addressForm.addEventListener('submit', this.findAddressHandler.bind(this));
    locateUserBtn.addEventListener('click', this.locateUserHandler.bind(this));
  }

  sharePlaceHandler() {
    const shareLinkInputElement = document.getElementById('share-link');
    if (!navigator.clipboard) {
      alert('Your browser does not support Clipboard - Copy link manually!');
      shareLinkInputElement.select();
      return;
    }

    navigator.clipboard
      .writeText(shareLinkInputElement.value)
      .then(() => {
        alert('Copied into clipboard!');
        shareLinkInputElement.select();
      })
      .catch(err => {
        console.log(err);
        shareLinkInputElement.select();
      });
  }

  selectPlace(coordinates, address) {
    if (this.Map) {
      this.Map.render(coordinates);
    } else {
      this.Map = new Map(coordinates);
    }

    this.shareBtn.disabled = false;
    const shareLinkInputElement = document.getElementById('share-link');
    shareLinkInputElement.value = `${
      location.origin
    }/dist/my-place?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${
      coordinates.lng
    }`;
  }

  locateUserHandler() {
    if (!navigator.geolocation) {
      alert('Geolocation is not available in your browser!');
      return;
    }
    const modal = new Modal(
      'loading-modal-content',
      'Loading location - please wait..',
    );
    modal.show();

    navigator.geolocation.getCurrentPosition(
      async successResult => {
        const coordinates = {
          lat: successResult.coords.latitude,
          lng: successResult.coords.longitude,
        };
        const address = await getAddressFromCoords(coordinates);
        modal.hide();
        this.selectPlace(coordinates, address);
      },
      error => {
        modal.hide();
        alert('Could not get your location. Please enter manually!');
      },
    );
  }

  async findAddressHandler(event) {
    event.preventDefault();
    const address = event.target.querySelector('input').value;
    if (!address || address.trim().length === 0) {
      alert('Invalid address entered!');
      return;
    }
    const modal = new Modal(
      'loading-modal-content',
      'Loading location - please wait..',
    );
    modal.show();

    try {
      const coordinates = await getCoordsFromAddress(address);
      this.selectPlace(coordinates, address);
    } catch (err) {
      alert(err.message);
    }
    modal.hide();
  }
}

const placeFinder = new PlaceFinder();
