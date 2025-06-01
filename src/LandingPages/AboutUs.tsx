function AboutUs() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">About Us</h1>
        <p className="lead text-muted">
          Discover the story behind our music streaming platform.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Our Mission</h5>
              <p className="card-text">
                To connect music lovers with artists through seamless experiences.
                We aim to offer a user-friendly and intelligent platform to discover,
                stream, and enjoy music like never before.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Our Vision</h5>
              <p className="card-text">
                To revolutionize music discovery using advanced algorithms and a personalized
                interface that evolves with listener preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Technology</h5>
              <p className="card-text">
                This platform is built using the MERN stack—MongoDB, Express, React, and Node.js—
                ensuring a scalable backend and smooth user interface on the front end.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Join Us</h5>
              <p className="card-text">
                We welcome feedback, suggestions, and collaboration. Help us shape
                the future of music streaming by sharing your thoughts and passion with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
