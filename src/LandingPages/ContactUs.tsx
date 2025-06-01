function ContactUs() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Contact Us</h1>
        <p className="lead text-muted">
          We'd love to hear from you! Fill out the form or reach out through the details below.
        </p>
      </div>

      <div className="row g-4">
        {/* Contact Form */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Send Us a Message</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Your Name</label>
                  <input type="text" className="form-control" id="name" placeholder="Enter your name" />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input type="email" className="form-control" id="email" placeholder="name@example.com" />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea className="form-control" id="message" rows={4} placeholder="Type your message here..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Contact Information</h5>
              <p className="card-text">
                <strong>Email:</strong> support@musicstream.com<br />
                <strong>Phone:</strong> +1 234 567 8901<br />
                <strong>Address:</strong><br />
                123 Music Ave,<br />
                Melody City, Tune State 45678
              </p>
              <p className="text-muted">
                You can also reach out to us on our social media platforms for quick queries and updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
