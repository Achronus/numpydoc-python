# numpydoc-python: VSCode NumPy-doc Style Docstring Generator

Visual Studio Code extension to quickly generate `numpydoc`-style docstrings for Python functions.

```python
def example(ex1: float, ex2: int | None = None) -> Tuple[float, dict[str, str]]:
    """
    _summary_

    Parameters
    ----------
    ex1 : float
        _description_
    ex2 : int (optional)
        _description_. Default is `None`

    Returns
    -------
    _name_ : float
        _description_
    _name_ : dict[str, str]
        _description_

    Raises
    ------
    _name_ : ValueError
        _description_
    """
    raise ValueError()
```

## Features

- Quickly generate a NumPy-formatted docstring snippet that can be tabbed through.
- Infers parameter types through pep484 type hints, default values, and variable names.
- Support for args, kwargs, decorators, errors, and parameter types.
- Automatic tuple unpacking for return types.
- Automatic removal of `| None` type hints when default value is `None`.
- Support for custom docstring templates via configuration.

## Docstring Format

This extension generates docstrings in [`numpydoc` format](https://numpydoc.readthedocs.io/en/latest/format.html).

## Usage

Cursor must be on the line directly below the definition to generate full auto-populated docstring.

- Press enter after opening docstring with triple quotes (configurable `"""` or `'''`)
- Keyboard shortcut: `ctrl+shift+2` or `cmd+shift+2` for Mac
  - Can be changed in Preferences -> Keyboard Shortcuts -> extension.generateDocstring
- Command: `Generate Docstring`
- Right click menu: `Generate Docstring`

## Installation

Requires local (offline) VSCode extension install using `npm` and `vsce`:

```bash
# Clone repo
git clone https://github.com/Achronus/numpydoc-python.git
cd numpydoc-python

# Install VSCode extension manager globally
npm install -g @vscode/vsce

# Install node packages
npm install

# Create the '.vsix' file
vsce package
```

Install the `.vsix` file in VSCode:

- Open Command panel (`Ctrl+Shift+P` or `Cmd+Shift+P`)
- Select `Extensions: Install from VSIX...`
- Choose the `numpydoc-python-[version].vsix` file

Verify its installed in the `Extensions` tabs by searching for `NumPy-doc`.

## Extension Settings

This extension contributes the following settings:

- `numpydoc.customTemplatePath`: Path to a custom docstring template (absolute or relative to the project root)
- `numpydoc.generateDocstringOnEnter`: Generate the docstring on pressing enter after opening docstring
- `numpydoc.includeName`: Include function name at the start of docstring
- `numpydoc.startOnNewLine`: New line before summary placeholder
- `numpydoc.guessTypes`: Infer types from type hints, default values and variable names
- `numpydoc.quoteStyle`: The style of quotes for docstrings

## Custom Docstring Templates

This extension supports custom templates via the `numpydoc.customTemplatePath` configuration. The extension uses the [mustache.js](https://github.com/janl/mustache.js/) templating engine. To use a custom template, create a .mustache file and specify its path using the configuration option. View the included [`numpydoc` template](src/docstring/templates/numpydoc.mustache) for a usage example. The following tags are available for use in custom templates.

### Variables

```text
{{name}}                        - name of the function
{{summaryPlaceholder}}          - _summary_ placeholder
{{extendedSummaryPlaceholder}}  - [extended_summary] placeholder
```

### Sections

```text
{{#args}}                       - iterate over function arguments
    {{var}}                     - variable name
    {{typePlaceholder}}         - _type_ or guessed type  placeholder
    {{descriptionPlaceholder}}  - _description_ placeholder
{{/args}}

{{#kwargs}}                     - iterate over function kwargs
    {{var}}                     - variable name
    {{typePlaceholder}}         - _type_ or guessed type placeholder
    {{&default}}                - default value (& unescapes the variable)
    {{descriptionPlaceholder}}  - _description_ placeholder
{{/kwargs}}

{{#exceptions}}                 - iterate over exceptions
    {{type}}                    - exception type
    {{descriptionPlaceholder}}  - _description_ placeholder
{{/exceptions}}

{{#yields}}                     - iterate over yields
    {{typePlaceholder}}         - _type_ placeholder
    {{descriptionPlaceholder}}  - _description_ placeholder
{{/yields}}

{{#returns}}                    - iterate over returns
    {{typePlaceholder}}         - _type_ placeholder
    {{descriptionPlaceholder}}  - _description_ placeholder
{{/returns}}
```

### Additional Sections

```text
{{#argsExist}}          - display contents if args exist
{{/argsExist}}

{{#kwargsExist}}        - display contents if kwargs exist
{{/kwargsExist}}

{{#parametersExist}}    - display contents if args or kwargs exist
{{/parametersExist}}

{{#exceptionsExist}}    - display contents if exceptions exist
{{/exceptionsExist}}

{{#yieldsExist}}        - display contents if returns exist
{{/yieldsExist}}

{{#returnsExist}}       - display contents if returns exist
{{/returnsExist}}

{{#placeholder}}        - makes contents a placeholder
{{/placeholder}}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## References

This project is adapted from the [autoDocstring (GitHub)](https://github.com/NilsJPWerner/autoDocstring) VSCode extension.
