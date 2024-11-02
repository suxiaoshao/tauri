wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "host",
});

pub use exports::extension::host::extension_api::*;
