import pool from '../config/db.js';

export const addCompany = async (req, res) => {
  try {
    const { company_name, industry_type, website, location, description } = req.body;

    if (!company_name || !industry_type || !website || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingCompany = await pool.query(
      `SELECT company_id FROM company WHERE company_name = $1`,
      [company_name]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Company already exists"
      });
    }

    const newCompany = await pool.query(
        `INSERT INTO company (company_name, industry_type, website, location, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [company_name, industry_type, website, location, description]
    );

    res.status(201).json({
      success: true,
      message: "Company added successfully",
      company: newCompany.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await pool.query('SELECT * FROM company');
    res.status(200).json(companies.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};