package main

import (
	"archive/zip"
	"context"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx   context.Context
	dbMgr *DBManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	mgr, err := NewDBManager()
	if err != nil {
		fmt.Printf("Error initializing database: %v\n", err)
		return
	}
	a.dbMgr = mgr
}

// shutdown is called when the application is closing
func (a *App) shutdown(ctx context.Context) {
	if a.dbMgr != nil {
		a.dbMgr.Close()
	}
}

// ListThemes retrieves all saved themes
func (a *App) ListThemes() ([]Theme, error) {
	if a.dbMgr == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.dbMgr.ListThemes()
}

// GetTheme retrieves a specific theme's detailed token structure
func (a *App) GetTheme(id int64) (*ThemeDetail, error) {
	if a.dbMgr == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.dbMgr.GetTheme(id)
}

// SaveTheme saves or updates a theme's details
func (a *App) SaveTheme(detail ThemeDetail) (int64, error) {
	if a.dbMgr == nil {
		return 0, fmt.Errorf("database not initialized")
	}
	return a.dbMgr.SaveTheme(&detail)
}

// DuplicateTheme duplicates an existing theme
func (a *App) DuplicateTheme(id int64) (int64, error) {
	if a.dbMgr == nil {
		return 0, fmt.Errorf("database not initialized")
	}
	return a.dbMgr.DuplicateTheme(id)
}

// DeleteTheme deletes a theme
func (a *App) DeleteTheme(id int64) error {
	if a.dbMgr == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.dbMgr.DeleteTheme(id)
}

// GetExportHistory retrieves the export logs
func (a *App) GetExportHistory() ([]ExportLog, error) {
	if a.dbMgr == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.dbMgr.GetExportHistory()
}

// LogExport logs an export action
func (a *App) LogExport(themeID int64, exportType string) error {
	if a.dbMgr == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.dbMgr.AddExportLog(themeID, exportType)
}

// SaveExportFile prompts the user with a save file dialog and writes the content
func (a *App) SaveExportFile(suggestedFilename string, content string) (string, error) {
	selectedFile, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Style Export",
		DefaultFilename: suggestedFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Design Tokens & Styles",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return "", err
	}
	if selectedFile == "" {
		return "", fmt.Errorf("save cancelled")
	}

	err = os.WriteFile(selectedFile, []byte(content), 0644)
	if err != nil {
		return "", err
	}

	return selectedFile, nil
}

// SaveExportZip prompts the user with a save file dialog and writes the provided files into a ZIP archive
func (a *App) SaveExportZip(suggestedFilename string, files map[string]string) (string, error) {
	selectedFile, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Style Stack Zip",
		DefaultFilename: suggestedFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "ZIP Archive",
				Pattern:     "*.zip",
			},
		},
	})
	if err != nil {
		return "", err
	}
	if selectedFile == "" {
		return "", fmt.Errorf("save cancelled")
	}

	// Create zip file
	newZipFile, err := os.Create(selectedFile)
	if err != nil {
		return "", err
	}
	defer newZipFile.Close()

	zipWriter := zip.NewWriter(newZipFile)
	defer zipWriter.Close()

	for filename, content := range files {
		f, err := zipWriter.Create(filename)
		if err != nil {
			return "", err
		}
		_, err = f.Write([]byte(content))
		if err != nil {
			return "", err
		}
	}

	return selectedFile, nil
}
