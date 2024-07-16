import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	Container,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Paper,
	Typography,
	Checkbox,
	ListItemText,
	Radio,
	RadioGroup,
	FormControlLabel,
	AppBar,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTab = styled(Tab)(({ theme, selected }) => ({
	...(selected && {
		color: theme.palette.primary.main,
		fontWeight: theme.typography.fontWeightMedium,
		textDecoration: "underline",
	}),
}));

const Dashboard = () => {
	const [data, setData] = useState([]);
	const [countries, setCountries] = useState([]);
	const [selectedCountries, setSelectedCountries] = useState([]);
	const [selectedYears, setSelectedYears] = useState([]);
	const [chartType, setChartType] = useState("line");
	const [tabIndex, setTabIndex] = useState(0);

	useEffect(() => {
		axios.get("/api/countries/")
			.then((response) => {
				setCountries(response.data);
			})
			.catch((error) =>
				console.error("Error fetching countries:", error)
			);
	}, []);

	useEffect(() => {
		axios.get("/api/data/")
			.then((response) => {
				setData(response.data);
			})
			.catch((error) => console.error("Error fetching data:", error));
	}, []);

	const handleCountryChange = (event) => {
		const value = event.target.value;
		if (value.indexOf(-1) !== -1) {
			if (selectedCountries.length >= countries.length) {
				setSelectedCountries([]);
			} else {
				setSelectedCountries(countries.map((c) => c.id));
			}
		} else {
			setSelectedCountries(value);
		}
	};

	const handleYearChange = (event) => {
		const value = event.target.value;
		const years = [...new Set(data.map((item) => item.year))];
		if (value.indexOf(-1) !== -1) {
			if (selectedYears.length >= years.length) {
				setSelectedYears([]);
			} else {
				setSelectedYears(years);
			}
		} else {
			setSelectedYears(value);
		}
	};

	const handleChartTypeChange = (event) => {
		setChartType(event.target.value);
	};

	const handleTabChange = (event, newValue) => {
		setTabIndex(newValue);
	};

	const filteredData = () =>
		data.filter(
			(d) =>
				selectedCountries.includes(d.country) &&
				selectedYears.includes(d.year)
		);

	const transposedData = () => {
		return selectedYears.map((y) => {
			const yearData = data.filter(
				(d) => selectedCountries.includes(d.country) && d.year === y
			);
			return yearData.reduce(
				(yd, d) => {
					yd[d.country + "external_debt"] = d["external_debt"];
					yd[d.country + "education_expenditure"] =
						d["education_expenditure"];
					return yd;
				},
				{ year: y }
			);
		});
	};
	const squashedData = () => {
		return selectedCountries.map((c) => {
			const countryData = data.filter(
				(d) => selectedYears.includes(d.year) && d.country === c
			);
			return countryData.reduce(
				(pd, d) => {
					pd["external_debt"] += d["external_debt"];
					pd["education_expenditure"] +=
						d["education_expenditure"];
					return pd;
				},
				{ external_debt: 0, education_expenditure: 0 }
			);
		});
	};
	const formatNumber = (num) => Number(num).toFixed(2);

	const renderLineChart = () => {
		const colors = [
			"#8884d8",
			"#82ca9d",
			"#ffc658",
			"#d0ed57",
			"#a4de6c",
		];
		return (
			<LineChart
				data={transposedData()}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="year" />
				<YAxis />
				<Tooltip formatter={formatNumber} />
				<Legend />
				{Array.from(new Set(selectedCountries)).map(
					(country, index) => (
						<Line
							key={country}
							type="monotone"
							dataKey={country + "external_debt"}
							name={`${
								countries.find((c) => c.id === country)
									?.name
							} External Debt`}
							stroke={colors[index % colors.length]}
						/>
					)
				)}
			</LineChart>
		);
	};

	const renderBarChart = () => {
		const colors = [
			"#8884d8",
			"#82ca9d",
			"#ffc658",
			"#d0ed57",
			"#a4de6c",
		];
		return (
			<BarChart
				data={transposedData()}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="year" />
				<YAxis />
				<Tooltip formatter={formatNumber} />
				<Legend />
				{Array.from(new Set(selectedCountries)).map(
					(country, index) => (
						<Bar
							key={country}
							dataKey={country + "external_debt"}
							name={`${
								countries.find((c) => c.id === country)
									?.name
							} External Debt`}
							fill={colors[index % colors.length]}
						/>
					)
				)}
			</BarChart>
		);
	};

	const renderPieChart = () => {
		const pieData = squashedData();
		const colors = [
			"#8884d8",
			"#82ca9d",
			"#ffc658",
			"#d0ed57",
			"#a4de6c",
		];
		return (
			<PieChart>
				<Tooltip formatter={formatNumber} />
				<Pie
					data={pieData}
					dataKey="external_debt"
					nameKey="country"
					cx="50%"
					cy="50%"
					outerRadius={80}
					fill="#8884d8"
					label
				>
					{pieData.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={colors[index % colors.length]}
						/>
					))}
				</Pie>
				<Pie
					data={pieData}
					dataKey="education_expenditure"
					nameKey="country"
					cx="50%"
					cy="50%"
					innerRadius={90}
					outerRadius={120}
					fill="#82ca9d"
					label
				>
					{pieData.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={colors[index % colors.length]}
						/>
					))}
				</Pie>
			</PieChart>
		);
	};

	const renderCountrySelect = () => (
		<FormControl fullWidth>
			<InputLabel>Select Countries</InputLabel>
			<Select
				multiple
				value={selectedCountries}
				onChange={handleCountryChange}
				renderValue={(selected) => {
					if (selected.length === 0) {
						return "Select Countries";
					} else if (selected.length === countries.length) {
						return "All selected";
					} else {
						return selected
							.map(
								(id) =>
									countries.find(
										(country) => country.id === id
									)?.name
							)
							.join(", ");
					}
				}}
			>
				<MenuItem value={-1}>
					<Checkbox
						checked={
							selectedCountries.length === countries.length
						}
					/>
					<ListItemText primary={"Select All"} />
				</MenuItem>

				{countries.map((country) => (
					<MenuItem key={country.id} value={country.id}>
						<Checkbox
							checked={selectedCountries.includes(
								country.id
							)}
						/>
						<ListItemText primary={country.name} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);

	const renderYearSelect = () => {
		const years = [...new Set(data.map((item) => item.year))];
		return (
			<FormControl fullWidth>
				<InputLabel>Select Years</InputLabel>
				<Select
					multiple
					value={selectedYears}
					onChange={handleYearChange}
					renderValue={(selected) => {
						if (selected.length === 0) {
							return "Select Years";
						} else if (selected.length === years.length) {
							return "All selected";
						} else {
							return selected.join(", ");
						}
					}}
				>
					<MenuItem value={-1}>
						<Checkbox
							checked={
								selectedYears.length === years.length
							}
						/>
						<ListItemText primary={"Select All"} />
					</MenuItem>

					{years.map((year) => (
						<MenuItem key={year} value={year}>
							<Checkbox
								checked={selectedYears.includes(year)}
							/>
							<ListItemText primary={year} />
						</MenuItem>
					))}
				</Select>
			</FormControl>
		);
	};

	const renderMetadata = () => (
		<div>
			<Typography variant="h6">Metadata</Typography>
			<ul>
				<li>Source: World Bank</li>
				<li>Last Updated: 2024</li>
				<li>Data Points: {data.length}</li>
				<li>Countries: {countries.length}</li>
			</ul>
		</div>
	);

	const renderTable = () => (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Year</TableCell>
					<TableCell>Country</TableCell>
					<TableCell>External Debt</TableCell>
					<TableCell>Education Expenditure</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{filteredData().map((row) => (
					<TableRow key={`${row.year}-${row.country}`}>
						<TableCell>{row.year}</TableCell>
						<TableCell>
							{
								countries.find(
									(country) =>
										country.id === row.country
								)?.name
							}
						</TableCell>
						<TableCell>
							{formatNumber(row.external_debt)}
						</TableCell>
						<TableCell>
							{formatNumber(row.education_expenditure)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<Container>
			<AppBar position="static">
				<Tabs
					value={tabIndex}
					onChange={handleTabChange}
					aria-label="dashboard tabs"
					sx={{ backgroundColor: "#f5f5f5" }}
				>
					<StyledTab
						label="Table"
						value={0}
						selected={tabIndex === 0}
					/>
					<StyledTab
						label="Dashboard"
						value={1}
						selected={tabIndex === 1}
					/>
					<StyledTab
						label="Metadata"
						value={2}
						selected={tabIndex === 2}
					/>
				</Tabs>
			</AppBar>
			<Grid container spacing={3} style={{ marginTop: 20 }}>
				<Grid item xs={6}>
					{renderCountrySelect()}
				</Grid>
				<Grid item xs={6}>
					{renderYearSelect()}
				</Grid>
			</Grid>
			{tabIndex === 0 && renderTable()}
			{tabIndex === 1 && (
				<>
					<Typography variant="h4" gutterBottom>
						Dashboard
					</Typography>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<FormControl component="fieldset">
								<RadioGroup
									row
									value={chartType}
									onChange={handleChartTypeChange}
								>
									<FormControlLabel
										value="line"
										control={<Radio />}
										label="Line Chart"
									/>
									<FormControlLabel
										value="bar"
										control={<Radio />}
										label="Bar Chart"
									/>
									<FormControlLabel
										value="pie"
										control={<Radio />}
										label="Pie Chart"
									/>
								</RadioGroup>
							</FormControl>
						</Grid>
					</Grid>
					<Grid container spacing={3} style={{ marginTop: 20 }}>
						<Grid item xs={12}>
							<Paper elevation={3} style={{ padding: 20 }}>
								<ResponsiveContainer
									width="100%"
									height={400}
								>
									{chartType === "line" &&
										renderLineChart()}
									{chartType === "bar" &&
										renderBarChart()}
									{chartType === "pie" &&
										renderPieChart()}
								</ResponsiveContainer>
							</Paper>
						</Grid>
					</Grid>
				</>
			)}
			{tabIndex === 2 && renderMetadata()}
		</Container>
	);
};

export default Dashboard;
