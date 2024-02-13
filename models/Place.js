const mongoose = require("mongoose");

// Creation of Schema (MongoDB Collection)
const placeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    minlength: 10,
    maxlength: 50,
  },
  address: String,
  photos: [String],
  description: {
    type: String,
    minlength: 100,
    maxlength: 500,
  },
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
  price: Number,
});

// Creation of Model so we can communicate with backend express code
const PlaceModel = mongoose.model("Place", placeSchema);

module.exports = PlaceModel;
