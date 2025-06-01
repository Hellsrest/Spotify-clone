function Homepage() {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-dark text-white text-center py-5">
        <div className="container">
          <h1 className="display-3 fw-bold">Welcome to MusicStream</h1>
          <p className="lead">
            Discover, like, and stream music tailored to your taste.
          </p>
          <a href="/register" className="btn btn-primary btn-lg mt-3">
            Get Started
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Personalized Music</h5>
                <p className="card-text">
                  Get recommendations based on your likes, genre preferences, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Create Playlists</h5>
                <p className="card-text">
                  Build your own playlists with your favorite songs and share them.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Upload & Share</h5>
                <p className="card-text">
                  Are you an artist? Upload your own tracks and grow your audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-light text-center py-4">
        <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} MusicStream. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Homepage;
