import React, { useEffect, useState } from "react";
import { getMyAddress, saveMyAddress } from "../../services/addressService";

const empty = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "BG",
  phone: ""
};

export default function Addresses() {
  const [model, setModel] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const a = await getMyAddress();
        if (alive && a) setModel({ ...empty, ...a });
      } catch {
        if (alive) setError("Could not load your address.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setModel((m) => ({ ...m, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setOk(false);
    try {
      await saveMyAddress(model);
      setOk(true);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-3">Loading address…</div>;

  return (
    <div className="container py-3">
      <h2 className="mb-3">My Address</h2>

      {ok && <div className="alert alert-success">Saved successfully.</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="card" onSubmit={onSubmit} noValidate>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Address line 1</label>
              <input
                className="form-control"
                name="addressLine1"
                value={model.addressLine1}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Address line 2</label>
              <input
                className="form-control"
                name="addressLine2"
                value={model.addressLine2}
                onChange={onChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">City</label>
              <input
                className="form-control"
                name="city"
                value={model.city}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">State/Region</label>
              <input
                className="form-control"
                name="state"
                value={model.state}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Postal code</label>
              <input
                className="form-control"
                name="postalCode"
                value={model.postalCode}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Country</label>
              <input
                className="form-control"
                name="country"
                value={model.country}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                name="phone"
                value={model.phone}
                onChange={onChange}
              />
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-center gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
