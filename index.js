require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const connectDb = require("./utils/db");
const { axiosInstance } = require("./baseUrl");
const Policy = require("./Models/Policy");
const { default: axios } = require("axios");
const qs = require("qs");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", true);
const authRoutes = require("./routes/auth");
const FullQuote = require("./Models/FullQuote");
const IssueQuote = require("./Models/IssueQuote");

// Routes
app.use("/api/auth", authRoutes);

const GetAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://sureinsureau-sandbox-in.insuremo.com/cas/ebao/v2/json/tickets",
      {
        username: process.env.ACCESSTOKEN_USERNAME,
        password: process.env.ACCESSTOKEN_PASSWORD,
      }
    );
    return response.data.access_token;
  } catch (err) {
    throw err;
  }
};

// Rest of the code...

app.get("/api/getAccessToken", async (req, res) => {
  try {
    const response = await GetAccessToken();
    res.send({ success: true, access_token: response });
  } catch (err) {
    res.send({ success: false, message: "unable to get access token" });
  }
});

app.post("/api/createquote", async (req, res) => {
  try {
    const access_token = await GetAccessToken();

    // Make the API call to the third-party service
    const response = await axiosInstance.post(
      "/sureinsureau/v1/appframework-bff-app/createQuote",
      req.body, // Request body
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.data?.CarrierQuoteNumber && response.data?.ProposalNo) {
      // Save to the database asynchronously
      (async () => {
        try {
          const newPolicy = new Policy({
            CarrierQuoteNumber: response.data.CarrierQuoteNumber,
            ProposalNo: response.data.ProposalNo,
            data: response.data,
          });
          await newPolicy.save();
        } catch (dbError) {
          console.error("Error saving policy to the database:", dbError);
        }
      })();
    }

    // Send response immediately without waiting for database save
    res.send({ success: true, quote: response.data });
  } catch (err) {
    console.error("Error creating quote:", err);
    res.status(500).send({ success: false, message: err.message });
  }
});

app.post("/api/fullquote", async (req, res) => {
  try {
    const access_token = await GetAccessToken();
    const response = await axiosInstance.post(
      "/sureinsureau/v1/appframework-bff-app/fullQuote",
      req.body, // Request body
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the Bearer token in the Authorization header
        },
      }
    );
    if (response.data?.CarrierQuoteNumber && response.data?.ProposalNo) {
      //   await Policy.findOneAndUpdate(
      //     {
      //       CarrierQuoteNumber: response.data.CarrierQuoteNumber,
      //       ProposalNo: response.data.ProposalNo,
      //     },
      //     {
      //       data: response.data,
      //     }
      //   );

      const newFullQuote = new FullQuote({
        CarrierQuoteNumber: response.data.CarrierQuoteNumber,
        ProposalNo: response.data.ProposalNo,
        data: response.data,
      });

      await newFullQuote.save();
    }
    res.send({ success: true, fullquote: response.data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, message: err });
  }
});

app.post("/api/issuequote", async (req, res) => {
  try {
    const access_token = await GetAccessToken();
    console.log("access token  L ", access_token);
    console.log("request body ", req.body);
    const response = await axiosInstance.post(
      "/sureinsureau/v1/appframework-bff-app/issueQuote",
      req.body, // Request body
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (response.data?.CarrierQuoteNumber && response.data?.ProposalNo) {
      //   await Policy.findOneAndUpdate(
      //     {
      //       CarrierQuoteNumber: response.data.CarrierQuoteNumber,
      //       ProposalNo: response.data.ProposalNo,
      //     },
      //     {
      //       data: response.data,
      //     }
      //   );

      const newIssueQuote = new IssueQuote({
        CarrierQuoteNumber: response.data.CarrierQuoteNumber,
        ProposalNo: response.data.ProposalNo,
        data: response.data,
      });

      await newIssueQuote.save();
    }
    res.send({ success: true, issuequote: response.data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, message: err });
  }
});

//GET All Plocies
app.get("/api/getPolicys", async (req, res) => {
  try {
    // Fetching data from the Policy model
    const Policys = await Policy.find();
    // Responding with the data
    res.send({ success: true, Policys });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Failed to fetch Issue quotes",
      error: err.message,
    });
  }
});

//GET All Full Quotes
app.get("/api/getfullquotes", async (req, res) => {
  try {
    // Fetching data from the FullQuote model
    const fullQuotes = await FullQuote.find();
    // Responding with the data
    res.send({ success: true, fullQuotes });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Failed to fetch full quotes",
      error: err.message,
    });
  }
});

// GET All Issued Quotes
app.get("/api/getIssuequotes", async (req, res) => {
  try {
    // Fetching data from the Issue model
    const IssueQuotes = await IssueQuote.find();
    // Responding with the data
    res.send({ success: true, IssueQuotes });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Failed to fetch Issue quotes",
      error: err.message,
    });
  }
});

app.post("/api/blockquote", async (req, res) => {
  try {
    const access_token = await GetAccessToken();
    const response = await axiosInstance.post(
      "/sureinsureau/v1/appframework-bff-app/blockQuote",
      req.body, // Request body
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the Bearer token in the Authorization header
        },
      }
    );
    if (response.data?.CarrierQuoteNumber && response.data?.ProposalNo) {
      await Policy.findOneAndUpdate(
        {
          CarrierQuoteNumber: response.data.CarrierQuoteNumber,
          ProposalNo: response.data.ProposalNo,
        },
        {
          data: response.data,
        }
      );
    }
    res.send({ success: true, blockquote: response.data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, message: err });
  }
});

app.get("/api/fetchalldocs/:entity/:value", async (req, res) => {
  try {
    const { entity, value } = req.params;
    const access_token = await GetAccessToken();
    if (!access_token)
      return res
        .status(400)
        .send({ success: false, message: "Invalid access token" });

    const headersPayload = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await axiosInstance.get(
      `/sureinsureau/v1/appframework-bff-app/doclist?value=${value}&entity=${entity}`,
      headersPayload
    );

    res.send({ success: true, Docs: response.data });
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

app.get("/api/downloaddoc/:entity/:value", async (req, res) => {
  try {
    const { entity, value } = req.params;
    const access_token = await GetAccessToken();
    const response = await axiosInstance.get(
      "/sureinsureau/v1/appframework-bff-app/downloaddoc?entity=" +
        entity +
        "&value=" +
        value,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        responseType: "arraybuffer", // Ensure the response is treated as binary data
      }
    );

    // Set the appropriate headers for the PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
    res.send(response.data);
  } catch (err) {
    console.log(err);
    res.send({ success: false, message: err });
  }
});

const GetAccessTokenProfile = async () => {
  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: "sureinsure-api",
    client_secret: "KySwpaYl3qJYfV2PxRLQTewES2eeAQF6",
  });
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  try {
    const response = await axios.post(
      "https://bpa-uat-australiaeast.chainthat.net/auth/realms/onepatch/protocol/openid-connect/token",
      data,
      config
    );

    if (response.data.access_token) {
      return response.data.access_token;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

app.post("/api/companyprofile", async (req, res) => {
  const access_token = await GetAccessTokenProfile();

  console.log(req.body, "body", access_token);
  axios
    .post(
      "https://bpa-uat-australiaeast.chainthat.net/connector-api/route/companyInformation/v1/companyProfile",
      {
        companyIdentifierType: "ABN",
        identifierValue: req.body.abn,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the Bearer token in the Authorization header
        },
      }
    )
    .then((response) => {
      res.send({ success: true, companyprofile: response.data });
    })
    .catch((err) => {
      res.send({ success: false, message: err });
    });
});
app.post("/api/address", async (req, res) => {
  console.log(req.body, "body");
  try {
    const access_token = await GetAccessTokenProfile();
    const response = await axios.post(
      "https://bpa-uat-australiaeast.chainthat.net/connector-api/route/addressSearch/v1/address",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the Bearer token in the Authorization header
        },
      }
    );
    res.send({ success: true, quote: response.data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, message: err });
  }
});

app.post("/api/makePayment", async (req, res) => {
  try {
    const { amount, proposal } = req.body;

    if (!amount || !proposal) {
      return res.status(400).json({
        success: false,
        message: "Amount and proposal are required",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `Proposal Number: ${proposal}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://uat.iamiinsurance.com.au/payments/success?session_id={CHECKOUT_SESSION_ID}&proposalNo=${proposal}`,
      cancel_url: "https://uat.iamiinsurance.com.au/payments/error",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/api/checkpayment", async (req, res) => {
  try {
    const access_token = await GetAccessToken(); // Get access token
    const { sessionId, proposalNo } = req.body; // Extract sessionId and proposalNo from body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const headersPayload = {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-ebao-tenant-Id": "sureinsureau",
        "x-ebao-tenant-code": "sureinsureau",
      },
    };
    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        session: session,
      });
    }

    const checkQuote = await axiosInstance.get(
      `/sureinsureau/v1/appframework-bff-app/loadQuote?proposalNo=${proposalNo}`,
      headersPayload
    );

    if (checkQuote.data && checkQuote.data.IssueDate) {
      return res
        .status(200)
        .send({ status: true, issueQuote: checkQuote.data });
    }

    const data = {
      ProposalNo: proposalNo,
      PolicyPaymentInfoList: [
        {
          ReferenceNo: sessionId,
        },
      ],
    };
    const issueQuote = await axiosInstance.post(
      `/sureinsureau/v1/appframework-bff-app/issueQuote`,
      data,
      headersPayload
    );

    return res.send({ status: true, issueQuote: issueQuote.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "An error occurred",
    });
  }
});

app.get("/api/Policies", async (req, res) => {
  try {
    const policies = await Policy.find(); // Fetch all policies from the database
    res.status(200).json(policies); // Return the policies in JSON format
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching policies" });
  }
});

app.get("/api/Policies/:ProposalNo", async (req, res) => {
  try {
    const proposalNo = req.params.ProposalNo;
    const policy = await Policy.findOne({ ProposalNo: proposalNo }); // Find policy by ProposalNo

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy); // Return the found policy
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the policy" });
  }
});

const PORT = 3000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`'server is running  at port : ' ${PORT}`);
  });
});
